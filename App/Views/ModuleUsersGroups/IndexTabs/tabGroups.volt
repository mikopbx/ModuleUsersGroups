<form method="post" action="module-users-groups/module-users-groups/save-default" role="form" class="ui grey segment form" id="default-group-form">
<h3 class="ui header">{{ t._("mod_usrgr_DefaultGroup") }}</h3>

<div class="inline field">
    <label for="defaultGroup">{{ t._('mod_usrgr_SelectDefaultGroup') }}</label>
    {{ form.render('defaultGroup') }}
</div>
</form>


{% for record in groups %}
    {% if loop.first %}
        <table class="ui selectable compact table" id="users-groups-table">
        <thead>
        <tr>
            <th>{{ t._('mod_usrgr_ColumnGroupName') }}</th>
            <th class="center aligned">{{ t._('mod_usrgr_ColumnGroupMembersCount') }}</th>
            <th>{{ t._('mod_usrgr_ColumnGroupDescription') }}</th>
            <th></th>
        </tr>
        </thead>
        <tbody>
    {% endif %}
    <tr class="group-row" id="{{ record.id }}">
        <td>{{ record.name }}</td>
        <td class="center aligned">{{ record.GroupMembers |length }}</td>
        <td class="">
            {% if not (record.description is empty) and record.description|length>80 %}
                <div class="ui basic icon button" data-content="{{ record.description }}" data-variation="wide">
                    <i class="file text icon"></i>
                </div>
            {% else %}
                {{ record.description }}
            {% endif %}
        </td>
        {{ partial("partials/tablesbuttons",
            [
                'id': record.id,
                'edit' : 'module-users-groups/module-users-groups/modify/',
                'delete': 'module-users-groups/module-users-groups/delete/'
            ]) }}
    </tr>

    {% if loop.last %}

        </tbody>
        </table>
    {% endif %}
{% endfor %}
