{{ form('module-users-groups/save', 'role': 'form', 'class': 'ui large form','id':'module-users-groups-form') }}
<input type="hidden" name="dirrty" id="dirrty"/>
<div class="ui top attached tabular menu" id="module-users-group-modify-menu">
    {% if id is null %}
        <a class="item active" data-tab="general">{{ t._('mod_usrgr__GeneralSettings') }}</a>
        <a class="item disabled" data-tab="users">{{ t._('mod_usrgr_UsersFilter') }}</a>
        <a class="item disabled" data-tab="rules">{{ t._('mod_usrgr_RoutingRules') }}</a>
    {% else %}
        <a class="item" data-tab="general">{{ t._('mod_usrgr__GeneralSettings') }}</a>
        <a class="item active"  data-tab="users">{{ t._('mod_usrgr_UsersFilter') }}</a>
        <a class="item"  data-tab="rules">{{ t._('mod_usrgr_RoutingRules') }}</a>
    {% endif %}
</div>

{% if id is null %}
<div class="ui bottom attached tab segment active" data-tab="general">
{{ form.render('id') }}

<div class="ten wide field">
    <label>{{ t._('mod_usrgr_ColumnGroupName') }}</label>
    {{ form.render('name') }}
</div>
<div class="field">
    <label>{{ t._('mod_usrgr_ColumnGroupDescription') }}</label>
    {{ form.render('description') }}
</div>
</div>
{% else %}
    <div class="ui bottom attached tab segment" data-tab="general">
        {{ form.render('id') }}

        <div class="ten wide field">
            <label>{{ t._('mod_usrgr_ColumnGroupName') }}</label>
            {{ form.render('name') }}
        </div>
        <div class="field">
            <label>{{ t._('mod_usrgr_ColumnGroupDescription') }}</label>
            {{ form.render('description') }}
        </div>
    </div>
<div class="ui bottom attached tab segment active" data-tab="users">

    <div class="ten wide field">
        <label>{{ t._('mod_usrgr_SelectMemberToAddToGroup') }}</label>
        {{ form.render('select-extension-field') }}
    </div>

        {% for member in members %}
        {% if loop.first %}
            <table class="ui very compact table" id="extensions-table" data-page-length='12'>
            <thead>
            <tr>
                <th>{{ t._('ex_Name') }}</th>
                <th class="center aligned">{{ t._('ex_Extension') }}</th>
                <th class="center aligned">{{ t._('ex_Mobile') }}</th>
                <th class="center aligned">{{ t._('ex_Email') }}</th>
                <th></th>
            </tr>
            </thead>
            <tbody>
        {% endif %}

            {% if member['hidden'] %}
                <tr class="member-row" style="display: none;" id="ext-{{ member['number'] }}">
            {% else  %}
                <tr class="member-row selected-member"  id="ext-{{ member['number'] }}">
            {% endif %}


            <td class="disability">
                <img src="{{ member['avatar'] }}" class="ui avatar image"
                     data-value="{{ member['userid'] }} /"> {{ member['username'] }}
            </td>
            <td class="center aligned disability">{{ member['number'] }}</td>
            <td class="center aligned disability">{{ member['mobile'] }}</td>
            <td class="center aligned disability">{{ member['email'] }}</td>
            <td class="center aligned disability">
                <div class="ui tiny basic icon button delete-user-row" data-value="ext-{{ member['number'] }}"><i class="ui red icon delete"></i> </div>
            </td>
        </tr>
        {% if loop.last %}
            </tbody>
            </table>
        {% endif %}
    {% endfor %}
</div>
<div class="ui bottom attached tab segment" data-tab="rules">
    {% for rule in rules %}
        {% if loop.first %}
            <table class="ui selectable compact table" id="outbound-rules-table">
            <thead>
            <tr>
                <th></th>
                <th>{{ t._('or_TableColumnName') }}</th>
                <th>{{ t._('or_TableColumnRule') }}</th>
                <th>{{ t._('or_TableColumnProvider') }}</th>
                <th>{{ t._('mod_usrgr_ColumnCallerId') }}</th>
            </tr>
            </thead>
            <tbody>
        {% endif %}

        <tr class="rule-row" id="{{ rule['id'] }}">
            <td class="collapsing">
                <div class="ui fitted toggle checkbox">
                    <input type="checkbox" {% if rule['status']!=='disabled' %} checked {% endif %} name="rule-{{ rule['id'] }}" data-value="{{ rule['id'] }}">
                    <label></label>
                </div>
            </td>
            <td class="disability {{ rule['status'] }}">{{ rule['rulename'] }}</td>
            <td class="disability {{ rule['status'] }}">
                {% if (rule['restnumbers']>0) %}
                    {{ t._('or_RuleDescription',['numberbeginswith':rule['numberbeginswith'],'restnumbers':rule['restnumbers']]) }}
                {% elseif (rule['restnumbers']==0) %}
                    {{ t._('or_RuleDescriptionFullMatch',['numberbeginswith':rule['numberbeginswith']]) }}
                {% elseif (rule['restnumbers']==-1) %}
                    {{ t._('or_RuleDescriptionBeginMatch',['numberbeginswith':rule['numberbeginswith']]) }}
                {% endif %}
            </td>
            <td class="disability {{ rule['status'] }}">{{ rule['provider'] }}</td>
            <td class="disability {{ rule['status'] }}"><input name="caller_id-{{ rule['id'] }}" value="{{ rule['callerid'] }}"/></td>
        </tr>
        {% if loop.last %}
            </tbody>
            </table>
        {% endif %}
    {% endfor %}
</div>
{% endif %}


{{ partial("partials/submitbutton",['indexurl':'module-users-groups/index/']) }}
</form>
