#!/bin/bash
# Test script for voice notification feature in ModuleUsersGroups
# This script helps verify that the voice notification dialplan is correctly generated

set -e

CONTAINER="mikopbx_php83"
SOUND_DIR="/storage/usbdisk1/mikopbx/custom_modules/sounds/ModuleUsersGroups"
SOUND_FILE="$SOUND_DIR/forbidden.wav"

echo "=== ModuleUsersGroups Voice Notification Test ==="
echo ""

# Function to check if container is running
check_container() {
    if ! docker ps | grep -q "$CONTAINER"; then
        echo "❌ Container $CONTAINER is not running"
        exit 1
    fi
    echo "✅ Container $CONTAINER is running"
}

# Function to check dialplan context
check_dialplan() {
    echo ""
    echo "Checking dialplan context 'users-group-forbidden'..."

    OUTPUT=$(docker exec $CONTAINER asterisk -rx "dialplan show users-group-forbidden" 2>&1)

    if echo "$OUTPUT" | grep -q "There is no existence of"; then
        echo "❌ Context 'users-group-forbidden' not found in dialplan"
        echo "   Module may not be enabled or configs not regenerated"
        return 1
    fi

    if echo "$OUTPUT" | grep -q "NoOp(--- Call to"; then
        echo "✅ Context 'users-group-forbidden' exists in dialplan"
        echo ""
        echo "Generated dialplan:"
        echo "$OUTPUT"
        return 0
    else
        echo "⚠️  Context exists but may be incomplete"
        echo "$OUTPUT"
        return 1
    fi
}

# Function to check sound file
check_sound_file() {
    echo ""
    echo "Checking custom sound file..."

    if docker exec $CONTAINER test -f "$SOUND_FILE"; then
        echo "✅ Custom sound file exists: $SOUND_FILE"

        # Show file info
        FILE_INFO=$(docker exec $CONTAINER ls -lh "$SOUND_FILE")
        echo "   $FILE_INFO"

        # Check file permissions
        if docker exec $CONTAINER test -r "$SOUND_FILE"; then
            echo "✅ File is readable"
        else
            echo "⚠️  File exists but may not be readable"
        fi
    else
        echo "ℹ️  Custom sound file not found: $SOUND_FILE"
        echo "   Default 'invalid' message will be used"
        echo ""
        echo "To add custom sound:"
        echo "   1. Create WAV file (8000 Hz, Mono)"
        echo "   2. Copy to: $SOUND_DIR/"
        echo "   3. docker exec $CONTAINER mkdir -p $SOUND_DIR"
        echo "   4. docker cp forbidden.wav $CONTAINER:$SOUND_FILE"
    fi
}

# Function to check extensions.conf
check_extensions_conf() {
    echo ""
    echo "Checking extensions.conf for context..."

    CONF_FILE="/etc/asterisk/extensions.conf"

    if docker exec $CONTAINER grep -q "users-group-forbidden" "$CONF_FILE"; then
        echo "✅ Context found in $CONF_FILE"

        echo ""
        echo "Context definition:"
        docker exec $CONTAINER grep -A 10 "\[users-group-forbidden\]" "$CONF_FILE" | head -15
    else
        echo "❌ Context NOT found in $CONF_FILE"
        echo "   Please regenerate Asterisk configs:"
        echo "   docker exec $CONTAINER asterisk -rx 'module reload pbx_config.so'"
    fi
}

# Function to test dialplan execution
test_dialplan_execution() {
    echo ""
    echo "Testing dialplan execution (dry run)..."

    # Use asterisk dialplan show to verify the context can be executed
    TEST_EXTEN="79001234567"

    OUTPUT=$(docker exec $CONTAINER asterisk -rx "dialplan show users-group-forbidden@$TEST_EXTEN" 2>&1)

    if echo "$OUTPUT" | grep -q "NoOp\|Answer\|Playback"; then
        echo "✅ Dialplan context can be executed"
    else
        echo "⚠️  Could not verify dialplan execution"
    fi
}

# Function to show usage instructions
show_instructions() {
    echo ""
    echo "=== Manual Testing Instructions ==="
    echo ""
    echo "1. Configure group isolation in web interface:"
    echo "   - Go to ModuleUsersGroups settings"
    echo "   - Enable 'Isolate' for a group"
    echo "   - Add some users to that group"
    echo ""
    echo "2. Make a test call:"
    echo "   - Call from isolated group user"
    echo "   - Try to call external number or non-group user"
    echo "   - You should hear the voice notification"
    echo ""
    echo "3. Monitor Asterisk logs:"
    echo "   docker exec $CONTAINER asterisk -rvvv"
    echo "   # Or check logs:"
    echo "   docker exec $CONTAINER tail -f /storage/usbdisk1/mikopbx/log/asterisk/messages"
    echo ""
    echo "4. Custom dialplan hook (optional):"
    echo "   - Create: /storage/usbdisk1/mikopbx/custom_modules/conf.d/extensions_custom.conf"
    echo "   - Add [users-group-forbidden-custom] context"
    echo "   - Reload: docker exec $CONTAINER asterisk -rx 'dialplan reload'"
}

# Main execution
main() {
    check_container
    check_dialplan
    check_sound_file
    check_extensions_conf
    test_dialplan_execution
    show_instructions

    echo ""
    echo "=== Test Complete ==="
}

# Run main function
main
