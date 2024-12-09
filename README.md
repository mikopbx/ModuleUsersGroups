## Module Users Groups

This module provides functionality for managing user groups and their associated permissions, including:

**Inputs**

* **Group Name**: Defines a unique name for the user group.
* **Description**: A brief explanation or details about the purpose of the group.
* **Patterns**: A list of number patterns that group members are allowed to call. This can include specific numbers, ranges, or patterns using wildcards.
* **Isolate**: Enables isolation for the group, restricting members to call only within their group or to numbers matching the defined patterns.
* **Isolate Pickup**: Enables isolation for the call pickup function, allowing only group members to pick up calls from other members within the same group.
* **Default Group**: Sets a specific group as the default group for new users.
* **Users**: Selects individual users to assign to a specific group.
* **Routing Rules**:  Defines outbound routing rules and applies them to specific groups, along with custom caller IDs for each rule.

**Outputs**

* **User Groups**: Creates and manages user groups with the specified settings.
* **Group Membership**: Assigns individual users to specific groups.
* **Call Restrictions**: Implements call restrictions based on group settings, allowing or denying calls based on isolation and defined patterns.
* **Call Pickup Restrictions**: Implements restrictions on call pickup based on group settings, allowing only members within the same group to pick up calls from each other.
* **Outbound Routing Rules**: Applies outbound routing rules to specific groups and sets custom caller IDs for those rules.

This module enhances call management and security by providing granular control over user permissions and call routing based on group affiliations. It allows administrators to define specific communication policies for different user groups, ensuring efficient and secure call handling within the organization.