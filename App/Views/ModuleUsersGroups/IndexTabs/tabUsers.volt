<select id="users-groups-list" style="display: none;">
    {% for record in groups %}
        <option value="{{ record.id }}">{{ record.name }}</option>
    {% endfor %}
</select>

{% for member in members %}
    {% if loop.first %}
        <table class="ui selectable compact table" id="users-table" data-page-length='12'>
        <thead>
        <tr>
            <th>{{ t._('ex_Name') }}</th>
            <th class="center aligned">{{ t._('ex_Extension') }}</th>
            <th class="center aligned">{{ t._('ex_Mobile') }}</th>
            <th class="center aligned">{{ t._('ex_Email') }}</th>
            <th class="center aligned">{{ t._('mod_usrgr_ColumnGroup') }}</th>
        </tr>
        </thead>
        <tbody>
    {% endif %}

    <tr class="member-row" id="{{ member['userid'] }}">
        <td>
            <img src="{{ member['avatar'] }}" class="ui avatar image"
                 data-value="{{ member['userid'] }} /"> {{ member['username'] }}
        </td>
        <td class="center aligned">{{ member['number'] }}</td>
        <td class="center aligned">{{ member['mobile'] }}</td>
        <td class="center aligned">{{ member['email'] }}</td>
        <td class="left aligned">
            <div class="ui dropdown select-group" data-value="{{ member['group'] }}">
                <div class="text">{{ member['group'] }}</div>
                <i class="dropdown icon"></i>
            </div>
        </td>
    </tr>
    {% if loop.last %}
        </tbody>
        </table>
    {% endif %}
{% endfor %}