{% for rule in rules %}
    {% if loop.first %}
        <table class="ui selectable compact unstackable table" id="outbound-rules-table">
        <thead>
        <tr>
            <th></th>
            <th>{{ t._('or_TableColumnName') }}</th>
            <th>{{ t._('or_TableColumnProvider') }}</th>
            <th>{{ t._('mod_usrgr_ColumnCallerId') }}</th>
        </tr>
        </thead>
        <tbody>
    {% endif %}

    <tr class="rule-row" id="{{ rule['id'] }}">
        <td class="collapsing">
            <div class="ui fitted toggle checkbox">
                <input type="checkbox" {% if rule['status']!=='disabled' %} checked {% endif %}
                       name="rule-{{ rule['id'] }}" data-value="{{ rule['id'] }}">
                <label></label>
            </div>
        </td>
        <td class="disability {{ rule['status'] }}">{{ rule['rulename'] }}</td>
        <td class="disability {{ rule['status'] }}">{{ rule['provider'] }}</td>
        <td class="disability {{ rule['status'] }}">
            <div class="ui input fluid">
                <input type="text" name="caller_id-{{ rule['id'] }}" value="{{ rule['callerid'] }}" placeholder="{{ t._('mod_usrgr_ColumnCallerId') }}"/>
            </div>
        </td>
    </tr>
    {% if loop.last %}
        </tbody>
        </table>
    {% endif %}
{% endfor %}