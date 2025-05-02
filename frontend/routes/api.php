
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\TranscriptionController;

Route::get('/ping', [TranscriptionController::class, 'ping']);
Route::post('/upload', [TranscriptionController::class, 'upload']);
Route::get('/status/{jobId}', [TranscriptionController::class, 'status']);
Route::get('/result/{jobId}', [TranscriptionController::class, 'result']);
