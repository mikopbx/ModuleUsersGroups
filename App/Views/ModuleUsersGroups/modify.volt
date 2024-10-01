<form method="post" action="module-users-groups/module-users-groups/save" role="form" class="ui large form" id="module-users-groups-form">
<div class="ui top attached tabular menu" id="module-users-group-modify-menu">
    {% if id is null %}
        <a class="item active" data-tab="general">{{ t._('mod_usrgr__GeneralSettings') }}</a>
        <a class="item disabled" data-tab="users">{{ t._('mod_usrgr_UsersFilter') }}</a>
        <a class="item disabled" data-tab="rules">{{ t._('mod_usrgr_RoutingRules') }}</a>
    {% else %}
        <a class="item" data-tab="general">{{ t._('mod_usrgr__GeneralSettings') }}</a>
        <a class="item active" data-tab="users">{{ t._('mod_usrgr_UsersFilter') }}</a>
        <a class="item" data-tab="rules">{{ t._('mod_usrgr_RoutingRules') }}</a>
    {% endif %}
</div>

{% if id is null %}
    <div class="ui bottom attached tab segment active" data-tab="general">
        {{ partial("Modules/ModuleUsersGroups/ModuleUsersGroups/ModifyTabs/tabGeneralSimple") }}
    </div>
{% else %}
    <div class="ui bottom attached tab segment" data-tab="general">
        {{ partial("Modules/ModuleUsersGroups/ModuleUsersGroups/ModifyTabs/tabGeneralFull") }}
    </div>
    <div class="ui bottom attached tab segment active" data-tab="users">
        {{ partial("Modules/ModuleUsersGroups/ModuleUsersGroups/ModifyTabs/tabUsers") }}
    </div>
    <div class="ui bottom attached tab segment" data-tab="rules">
        {{ partial("Modules/ModuleUsersGroups/ModuleUsersGroups/ModifyTabs/tabRules") }}
    </div>
{% endif %}

{{ partial("partials/submitbutton",['indexurl':'module-users-groups/module-users-groups/index/']) }}
</form>
