<?php
/**
 * Copyright (C) MIKO LLC - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Nikolay Beketov, 11 2019
 *
 */

namespace Modules\ModuleUsersGroups\App\Forms;

use Phalcon\Forms\Element\Hidden;
use Phalcon\Forms\Element\Select;
use Phalcon\Forms\Element\Text;
use Phalcon\Forms\Element\TextArea;
use Phalcon\Forms\Form;


class ModuleUsersGroupsForm extends Form
{

    public function initialize($entity = null, $options = null): void
    {
        // id
        $this->add(new Hidden('id', ['value' => $entity->id]));

        // Name
        $this->add(new Text('name'));

        // Description
        $rows = max(round(strlen($entity->description) / 95), 2);
        $this->add(new TextArea('description', ['rows' => $rows]));

        // failoverextension
        $extension = new Select(
            'select-extension-field', [], [
            'using'    => [
                'id',
                'name',
            ],
            'useEmpty' => true,
            'class'    => 'ui selection dropdown search select-extension-field',
        ]
        );
        $this->add($extension);
    }
}