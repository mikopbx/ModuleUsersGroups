# Phone Groups Management Module

The Phone Groups Management module for MikoPBX allows you to organize employees into groups with customizable calling permissions and restrictions. This provides flexible access control and helps enforce corporate calling policies.

## Overview

This module enables administrators to:

- **Organize users into groups** - Create departments, teams, or any logical groupings
- **Control calling permissions** - Restrict who can call whom based on group membership
- **Manage outbound routing** - Control which groups can use specific outbound routes
- **Customize caller IDs** - Set different caller IDs per group for outbound calls
- **Isolate call pickup** - Limit call pickup functionality within groups
- **Voice notifications** - Play customizable messages when calls are restricted

## Key Features

### Phone Groups Management

Create unlimited user groups and assign employees to them. Each group can have:

- **Unique name and description** for easy identification
- **Custom calling patterns** - Define which numbers the group can call
- **Isolation settings** - Restrict calls within the group or to specific patterns
- **Default group** - Automatically assign new users to a designated group

### Call Restrictions

#### Isolation Mode

When isolation is enabled for a group:
- Members can only call other members within the same group
- Members can call external numbers matching defined patterns
- Members cannot call users in other groups
- Users outside the group can still call isolated members

**Example patterns:**
```
_7XXX              # 4-digit internal numbers starting with 7
_8XXXXXXXXXX       # 11-digit numbers starting with 8
*80                # Specific service codes
911                # Emergency numbers
```

#### Use Cases

- **Reception Group** - No restrictions, can call everyone
- **Finance Department** - Isolated to internal finance team + specific external numbers
- **Sales Team** - Can call within team + customer number patterns
- **Management** - No restrictions, full access

### Outbound Route Control

Assign specific outbound routes to groups and set custom caller IDs:

- Control which groups can use expensive international routes
- Display department-specific caller IDs for outbound calls
- Prevent unauthorized use of premium routes
- Automatically restore original caller ID after call completion

### Call Pickup Restrictions

When pickup isolation is enabled:
- Users can only pick up calls from their group members
- Prevents accidental or unauthorized call interception
- Maintains privacy within departments

### Voice Notifications

When a user attempts a forbidden call:
- System plays a customizable voice message
- Supports 30+ languages with automatic selection
- Falls back to standard system message if custom audio unavailable
- Allows custom call handling hooks for advanced scenarios

## Installation

### Requirements

- MikoPBX version **2023.2.179** or higher
- PHP 7.4 or higher

### Installation Steps

1. Open MikoPBX web interface
2. Navigate to **System** → **Extension Modules**
3. Click **Upload Module** and select the module file
4. Click **Enable** to activate the module
5. The module menu will appear in **Routing** → **Phone Groups Management**

## Configuration

### Creating Your First Group

1. Go to **Routing** → **Phone Groups Management**
2. Click **Add Group** button
3. Enter group information:
   - **Name** - Unique identifier (e.g., "Sales Department")
   - **Description** - Optional detailed description
4. Configure isolation (if needed):
   - Enable **Isolation** checkbox to restrict calls
   - Add allowed number patterns (one per line)
5. Assign users:
   - Switch to **Users** tab
   - Drag users from available to selected list
6. Configure outbound routes (optional):
   - Switch to **Outbound Rules** tab
   - Check allowed routes
   - Enter custom caller ID for each route
7. Click **Save**

### Setting a Default Group

After creating a group, set it as default and it will be automatically assigned to all employees.

**Note:** New users will automatically be assigned to the default group.

### Assigning Users to Groups

**Method 1: During group creation**
- Use the Users tab to select group members

**Method 2: From Users tab**
- Go to **Routing** → **Phone Groups Management** → **Users** tab
- Use the dropdown in each user's row to change their group

**Method 3: When editing employee card**
- Go to **Employees** → **Open employee card**
- Select group and save

### Configuring Call Restrictions

To restrict calling for a group:

1. Edit the group
2. Enable **Isolation** checkbox
3. Add allowed patterns in the text area (one per line)
4. Save changes

**Pattern Examples:**
- `_7XXX` - Allow 4-digit numbers starting with 7
- `_8[0-5]XXXXXXX` - Allow 8-digit numbers starting with 8,80,81,82,83,84,85
- `*80` - Allow specific code
- `911` - Allow emergency number

**Testing:**
- Call from isolated user to another member in same group → Should work
- Call from isolated user to number matching pattern → Should work
- Call from isolated user to non-matching number → Should be blocked

### Configuring Outbound Routes

To control which routes a group can use:

1. Edit the group
2. Go to **Outbound Rules** tab
3. Check routes this group should access
4. Optionally enter custom caller ID for each route
5. Save changes

**Example:**
- Sales group: Allow "Local" and "Toll Free" routes with caller ID 555-0100
- Support group: Allow "Local" only with caller ID 555-0200
- Management: Allow all routes without custom caller IDs

## Voice Notifications Setup

### Basic Setup

The module automatically plays a message when calls are blocked. By default, it uses the standard Asterisk "number not in service" message.

## REST API

The module provides REST API endpoints for integration with external systems.

**Base URL:** `http://your-pbx.com/pbxcore/api/modules/ModuleUsersGroups/`

### Available Actions

- `getUserGroup` - Get user's assigned group
- `updateUserGroup` - Change user's group membership
- `getDefaultGroup` - Get the default group
- `setDefaultGroup` - Set a group as default
- `getGroupsStats` - Get member counts for all groups
- `cleanupOrphanedMembers` - Remove invalid group memberships

## Troubleshooting

### Users Not Restricted Despite Isolation

**Check:**
1. User is actually assigned to the isolated group
2. Called number doesn't match allowed patterns

### Outbound Routes Not Respecting Permissions

**Check:**
1. Group has route enabled in Outbound Rules tab
2. Module is enabled and configuration reloaded

**Solution:**
Disable and re-enable the module to rebuild configuration.

### Call Pickup Not Isolated

**Check:**
1. Pickup isolation checkbox is enabled for the group
2. Both users are in the same group

### Changes Not Taking Effect

After making any changes:
1. Save the group settings
2. Wait for automatic configuration reload (5-10 seconds)

## FAQ

**Q: Can I assign a user to multiple groups?**
A: No, each user can only belong to one group at a time.

**Q: What happens if I delete a group?**
A: Users from the deleted group will be automatically moved to the default group.

**Q: Can I delete the default group?**
A: No, you must first set another group as default before deleting it.

**Q: Do isolated groups block emergency calls?**
A: No, if you include emergency patterns (like 911) in allowed patterns, they will work.

**Q: Can non-isolated users call isolated users?**
A: Yes, isolation only restricts outgoing calls from isolated group members.

**Q: How many groups can I create?**
A: Unlimited. The module doesn't impose any limit on the number of groups.

**Q: Will isolation work for SIP trunks?**
A: Yes, isolation works for all call types - internal, external, and trunk calls.

**Q: Can I use different voice messages for different groups?**
A: Currently, one message per language is used for all groups. Custom per-group messages require custom dialplan modifications.

## Support

### Documentation

- **English:** [https://docs.mikopbx.com/mikopbx/v/english/modules/miko/module-users-groups](https://docs.mikopbx.com/mikopbx/v/english/modules/miko/module-users-groups)
- **Russian:** [https://docs.mikopbx.com/mikopbx/modules/miko/module-users-groups](https://docs.mikopbx.com/mikopbx/modules/miko/module-users-groups)

### Contact

- **Email:** help@miko.ru
- **Developer:** MIKO LLC
- **Website:** [https://www.mikopbx.com](https://www.mikopbx.com)

### System Requirements

- **Minimum MikoPBX Version:** 2023.2.179
- **PHP Version:** 7.4 or higher

## License

This module is licensed under the GNU GPL v3.0. See the [LICENSE](LICENSE) file for details.

---

## Recent Updates

**Version November 2025:**
- Added voice notification system with multi-language support
- Automatic fallback to standard Asterisk sounds
- Fixed auto-population of users when setting default group
- Added cleanup of old group membership records after backup restoration when some employees were deleted
- Improved REST API with dedicated action classes
- Enhanced error handling and logging

---