<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('total_price');
            $table->string('type', 30)->default('pickup');
            $table->string('status', 30)->default('created')->index();
            $table->string('payment_status', 30)->default('unpaid')->index();
            $table->unsignedInteger('paid_amount')->default(0);
            $table->timestampTz('picked_up_at')->nullable();
            $table->boolean('completed_by_user')->default(false);
            $table->timestampTz('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
