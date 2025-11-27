<?php

namespace App\Http\Requests\Orders;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
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
            'tenant_id' => ['required', 'integer', 'exists:tenants,id'],
            'type' => ['required', 'string', 'max:30'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.menu_id' => ['required', 'integer', 'distinct', 'exists:menus,id'],
            'items.*.qty' => ['required', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tenant_id.required' => 'Tenant wajib diisi.',
            'tenant_id.exists' => 'Tenant tidak ditemukan.',
            'type.required' => 'Tipe order wajib diisi.',
            'items.required' => 'Daftar item tidak boleh kosong.',
            'items.min' => 'Minimal satu item harus dipesan.',
            'items.*.menu_id.required' => 'Menu wajib diisi.',
            'items.*.menu_id.exists' => 'Menu tidak ditemukan.',
            'items.*.qty.required' => 'Jumlah wajib diisi.',
            'items.*.qty.min' => 'Jumlah minimal 1.',
        ];
    }
}
