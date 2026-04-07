[![License: GPL v3](https://img.shields.io/github/license/mikopbx/ModuleUsersGroups)](https://www.gnu.org/licenses/gpl-3.0)
[![Latest Release](https://img.shields.io/github/v/release/mikopbx/ModuleUsersGroups)](https://github.com/mikopbx/ModuleUsersGroups/releases)
[![MikoPBX](https://img.shields.io/badge/MikoPBX-2023.2.179%2B-blue)](https://www.mikopbx.com)
[![GitHub Issues](https://img.shields.io/github/issues/mikopbx/ModuleUsersGroups)](https://github.com/mikopbx/ModuleUsersGroups/issues)

[English](README.md) | [Русский](README.ru.md)

# ModuleUsersGroups

Call group management module for MikoPBX. Organize employees into groups with flexible calling permissions, outbound route control, and group isolation.

## Features

- Organize employees into call groups
- Control outbound calling permissions per group
- Set outbound Caller ID per group per route
- Isolate groups so members can only call within their group and allowed patterns
- Isolate call pickup within groups
- Automatically assign new employees to a default group
- REST API for external integration

## Installation

### From Marketplace

1. Open MikoPBX web interface
2. Go to **System** > **Extension Modules**
3. Find **ModuleUsersGroups** in the Marketplace and install it

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/mikopbx/ModuleUsersGroups/releases)
2. Go to **System** > **Extension Modules**
3. Click **Upload Module** and select the downloaded file
4. Enable the module

## Configuration

1. Navigate to **Routing** > **Call Group Management**
2. Click **Add Group** and enter a name
3. Configure isolation and allowed number patterns if needed
4. Assign users on the **Users** tab
5. Configure outbound routes and custom Caller IDs on the **Outbound Rules** tab
6. Save the group
7. Optionally set a default group for automatic assignment of new employees

## REST API

Base URL: `http://<your-pbx>/pbxcore/api/modules/ModuleUsersGroups/`

| Action             | Description              |
|--------------------|--------------------------|
| `getUserGroup`     | Get user's group         |
| `updateUserGroup`  | Update user's group      |
| `getDefaultGroup`  | Get default group        |
| `setDefaultGroup`  | Set default group        |

## Requirements

MikoPBX **2023.2.179** or higher.

## Support

- Documentation (EN): [docs.mikopbx.com](https://docs.mikopbx.com/mikopbx/v/english/modules/miko/module-users-groups)
- Documentation (RU): [docs.mikopbx.com](https://docs.mikopbx.com/mikopbx/modules/miko/module-users-groups)
- Issues: [GitHub Issues](https://github.com/mikopbx/ModuleUsersGroups/issues)
- Email: help@miko.ru

## License

[GPL-3.0-or-later](LICENSE)
