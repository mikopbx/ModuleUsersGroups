{% for rule in rules %}
    {% if loop.first %}
        <table class="ui selectable compact table" id="outbound-rules-table">
        <thead>
        <tr>
            <th class="two wide"></th>
            <th>{{ t._('or_TableColumnName') }}</th>
            <th>{{ t._('or_TableColumnProvider') }}</th>
            <th class="four wide">{{ t._('mod_usrgr_ColumnCallerId') }}</th>
        </tr>
        </thead>
        <tbody>
    {% endif %}

    <tr class="rule-row" id="{{ rule['id'] }}">
        <td>
            <div class="ui fitted toggle checkbox">
                <input type="checkbox" {% if rule['status']!=='disabled' %} checked {% endif %}
                       name="rule-{{ rule['id'] }}" data-value="{{ rule['id'] }}">
                <label></label>
            </div>
        </td>
        <td class="disability {{ rule['status'] }}">{{ rule['rulename'] }}</td>
        <td class="disability {{ rule['status'] }}">{{ rule['provider'] }}</td>
        <td class="disability {{ rule['status'] }}">
            <input name="caller_id-{{ rule['id'] }}" value="{{ rule['callerid'] }}"/>
        </td>
    </tr>
    {% if loop.last %}
        </tbody>
        </table>
    {% endif %}
{% endfor %}