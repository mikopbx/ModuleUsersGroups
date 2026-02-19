<div class="two fields">
    <div class="field">
        <label for="mod_usrgr_select_group_dropdown">{{ t._('mod_usrgr_SelectUserGroup') }}</label>
        {{ form.render('mod_usrgr_select_group') }}
        <div class="ui selection dropdown search select-group-field" id="mod_usrgr_select_group_dropdown">
            <i class="dropdown icon"></i>
            <div class="default text">{{ t._('mod_usrgr_SelectUserGroup') }}</div>
            <div class="menu">
                {% set groups = form.getUserOption('mod_usrgr_groups') %}
                {% set selectedGroupId = form.getUserOption('mod_usrgr_selected_group_id') %}
                {% if groups is not empty %}
                    {% for group in groups %}
                        <div class="item" data-value="{{ group.id }}">{{ group.name }}</div>
                    {% endfor %}
                {% endif %}
            </div>
        </div>
    </div>
</div>