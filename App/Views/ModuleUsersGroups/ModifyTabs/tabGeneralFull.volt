{{ form.render('id') }}

<div class="ten wide field">
    <label for="name">{{ t._('mod_usrgr_ColumnGroupName') }}</label>
    {{ form.render('name') }}
</div>
<div class="field">
    <label for="description">{{ t._('mod_usrgr_ColumnGroupDescription') }}</label>
    {{ form.render('description') }}
</div>
<div class="field">
    <div class="ui toggle checkbox ">
        {{ form.render('isolate') }}
        <label for="isolate">{{ t._('mod_usrgr_isolate') }}</label>
    </div>
    <div class="ui info message show-only-on-isolate-group">
        {{ t._('mod_usrgr_IsolateInstructions1') }}
        {{ t._('mod_usrgr_IsolateInstructions2') }}
    </div>
</div>
<div class="field">
    <div class="ui toggle checkbox ">
        {{ form.render('isolatePickUp') }}
        <label for="isolatePickUp">{{ t._('mod_usrgr_isolatePickUp') }}</label>
    </div>
</div>
<div class="field">
    <label for="patterns">{{ t._('mod_usrgr_patterns') }}</label>
    {{ form.render('patterns') }}
</div>