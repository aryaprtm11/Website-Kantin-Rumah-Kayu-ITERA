<?php

namespace App\Http\Requests\Menus;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:100'],
            'price' => ['sometimes', 'integer', 'min:0'],
            'category' => ['sometimes', 'nullable', 'string', 'max:50'],
            'photo_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'stock' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
