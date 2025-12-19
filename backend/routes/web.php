<?php

use Illuminate\Support\Facades\Route;

// Terapkan middleware 'frontend.only'
Route::middleware(['frontend.only'])->get('/', function () {
    return view('welcome');
});