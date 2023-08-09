<div class="ui basic segment" id="module-users-groups">
{{ link_to("module-users-groups/module-users-groups/modify", '<i class="add circle icon"></i> '~t._('mod_usrgr_AddNewUsersGroup'), "class": "ui blue button", "id":"add-new-button") }}
<div class="ui top attached tabular menu" id="main-users-groups-tab-menu">
    <a class="item active" data-tab="groups">{{ t._('mod_usrgr_Groups') }}</a>
    <a class="item" data-tab="users">{{ t._('mod_usrgr_Users') }}</a>
</div>
<div class="ui bottom attached tab segment active" data-tab="groups">
    {{ partial("Modules/ModuleUsersGroups/ModuleUsersGroups/IndexTabs/tabGroups") }}
</div>
<div class="ui bottom attached tab segment" data-tab="users">
    {{ partial("Modules/ModuleUsersGroups/ModuleUsersGroups/IndexTabs/tabUsers") }}
</div>
</div>