{{ form.render('id') }}

<div class="ten wide field">
    <label for="name">{{ t._('mod_usrgr_ColumnGroupName') }}</label>
    {{ form.render('name') }}
</div>
<div class="field">
    <label for="description">{{ t._('mod_usrgr_ColumnGroupDescription') }}</label>
    {{ form.render('description') }}
</div>