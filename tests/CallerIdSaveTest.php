<?php

declare(strict_types=1);

namespace MikoPBX\AdminCabinet\Controllers {
    class BaseController
    {
        public $request;
        public $view;
        public $flash;
        public $translation;
        public $db;
    }
}

namespace Modules\ModuleUsersGroups\Models {
    class UsersGroups
    {
        public static int $lookups = 0;

        public static function findFirstById($id)
        {
            self::$lookups++;
            return null;
        }
    }
}

namespace {
    require_once dirname(__DIR__) . '/Lib/CallerId.php';
    require_once dirname(__DIR__) . '/App/Controllers/ModuleUsersGroupsController.php';

    use Modules\ModuleUsersGroups\App\Controllers\ModuleUsersGroupsController;
    use Modules\ModuleUsersGroups\Models\UsersGroups;

    final class SaveBoundaryReached extends \RuntimeException
    {
    }

    final class SaveRequest
    {
        private array $data;
        private bool $post;

        public function __construct(array $data, bool $post)
        {
            $this->data = $data;
            $this->post = $post;
        }

        public function isPost(): bool
        {
            return $this->post;
        }

        public function getPost(): array
        {
            return $this->data;
        }
    }

    final class SaveFlash
    {
        public array $errors = [];

        public function error(string $message): void
        {
            $this->errors[] = $message;
        }
    }

    final class SaveTranslation
    {
        public function _(string $key): string
        {
            return $key;
        }
    }

    final class SaveDatabase
    {
        public int $begins = 0;

        public function begin(): void
        {
            $this->begins++;
            // Останавливаем тест до записи: проверяем только границу preflight.
            throw new SaveBoundaryReached();
        }
    }

    function checkSave(array $data, bool $valid, bool $post = true): void
    {
        UsersGroups::$lookups = 0;
        $controller = new ModuleUsersGroupsController();
        $controller->request = new SaveRequest($data + ['id' => '1'], $post);
        $controller->view = new \stdClass();
        $controller->flash = new SaveFlash();
        $controller->translation = new SaveTranslation();
        $controller->db = new SaveDatabase();
        $boundaryReached = false;
        try {
            $controller->saveAction();
        } catch (SaveBoundaryReached $e) {
            $boundaryReached = true;
        }

        if (!$post) {
            $ok = !$boundaryReached && UsersGroups::$lookups === 0 && $controller->flash->errors === [];
        } elseif ($valid) {
            $ok = $boundaryReached && UsersGroups::$lookups === 1 && $controller->db->begins === 1 && $controller->flash->errors === [];
        } else {
            $ok = !$boundaryReached && UsersGroups::$lookups === 0 && $controller->db->begins === 0
                && ($controller->view->success ?? null) === false
                && $controller->flash->errors === ['mod_usrgr_ValidateCallerIdInvalid'];
        }
        if (!$ok) {
            throw new \RuntimeException('Неверная обработка CallerID при сохранении: ' . var_export($data, true));
        }
    }

    foreach (['', '   ', '101', '+74951234567', 'anonymous', 'Sales <101>', '"Sales Team" <+101>', 'AZaz09 +-*#_.'] as $value) {
        checkSave(['rule-65' => 'on', 'caller_id-65' => $value], true);
    }
    foreach (['Name)g <101>', 'Name,tail <101>', '${SHELL(id)} <101>', 'Имя <101>', "Name\n<101>", "Name\t<101>", 'Name <101> tail', [], ['101'], 101] as $value) {
        checkSave(['rule-65' => 'on', 'caller_id-65' => $value], false);
        // Ошибка во втором маршруте тоже должна блокировать любые изменения первого.
        checkSave(['rule-88' => 'on', 'caller_id-88' => 'Sales <101>', 'rule-65' => 'on', 'caller_id-65' => $value], false);
    }
    checkSave(['rule-65' => 'on'], true);
    checkSave(['rule-65' => 'off', 'caller_id-65' => 'Имя <101>'], true);
    checkSave(['caller_id-65' => 'Имя <101>'], true);
    checkSave(['rule-65' => 'on', 'caller_id-65' => 'Name)g <101>'], false, false);

    echo "CallerID save preflight tests passed\n";
}
