<?php
/*
 * MikoPBX - free phone system for small business
 * Copyright © 2017-2023 Alexey Portnov and Nikolay Beketov
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 */

return [
    'repModuleUsersGroups'         => 'Модуль телефонные группы - %repesent%',
    'mo_ModuleModuleUsersGroups'   => 'Управление телефонными группами',
    'BreadcrumbModuleUsersGroups'  => 'Управление телефонными группами',
    'BreadcrumbModuleUsersGroupsModify' => 'Настройка телефонной группы',
    'SubHeaderModuleUsersGroups'   => 'Настройка прав для исходящих вызовов, управление исходящим CallerID, организация групп перехвата вызовов',
    'mod_usrgr_patterns'                 => 'Шаблоны номеров, относящихся к группе. Участник группы сможет звонить только на них',
    'mod_usrgr_Connected'                => 'Модуль подключен',
    'mod_usrgr_Disconnected'             => 'Модуль отключен',
    'mod_usrgr_isolate'                  => 'Изолировать группу сотрудников',
    'mod_usrgr_isolatePickUp'            => 'Изолировать функцию перехвата (Pickup)',

    'mod_usrgr_Groups'                   => 'Список телефонных групп',
    'mod_usrgr_Users'                    => 'Сотрудники',
    'mod_usrgr_AddNewUsersGroup'         => 'Создать телефонную группу',
    'mod_usrgr_ColumnGroupName'          => 'Группа',
    'mod_usrgr_ColumnGroupDescription'   => 'Описание',
    'mod_usrgr_ColumnGroupMembersCount'  => 'Количество в участников',
    'mod_usrgr_ValidateNameIsEmpty'      => 'Проверьте поле с названием группы',
    'mod_usrgr_ColumnGroup'              => 'Группа',
    'mod_usrgr__GeneralSettings'         => 'Настройки группы',
    'mod_usrgr_UsersFilter'              => 'Сотрудники группы',
    'mod_usrgr_RoutingRules'             => 'Правила исходящей маршрутизации',
    'mod_usrgr_ColumnCallerId'           => 'Caller ID',
    'mod_usrgr_SelectMemberToAddToGroup' => 'Выберите сотрудника',
    'mod_usrgr_SelectUserGroup'          => 'Выберите телефонную группу для сотрудника',
    'mod_usrgr_PatternsInstructions1'    => 'В шаблонах допускается использовать символ от 1 до 9 и символ X (любая цифра от 1-9)',
    'mod_usrgr_PatternsInstructions2'    => 'Участник группы сможет набрать только те номера, которые удовлетворяют шаблонам',
    'mod_usrgr_PatternsInstructions3'    => ' ',
    'mod_usrgr_PatternsInstructions4'    => 'Примеры шаблонов:',
    'mod_usrgr_PatternsInstructions5'    => '2XX - номера с 200 по 299',
    'mod_usrgr_PatternsInstructions6'    => '200001 - явно указанный внутренни номер, к примеру номер очереди',
    'mod_usrgr_PatternsInstructions7'    => '7XXXXXXXXXX - любой 11 значный номер начинающийся с 7',
    'mod_usrgr_IsolateInstructions1'     => 'Сотрудники группы смогут звонить только на номера своей группы.',
    'mod_usrgr_IsolateInstructions2'     => 'Сотрудники из других групп, не смогут позвонить на изолированную группу.',
    'mod_usrgr_ColumnDefaultGroup'       => 'Группа по-умолчанию',
    'mod_usrgr_ErrorOnDeleteDefaultGroup'=> 'Нельзя удалить группу по-умолчанию',
    'mod_usrgr_SelectDefaultGroup'       => 'Выберите группу',
    'mod_usrgr_DefaultGroup'             => 'Группа по-умолчанию',
];