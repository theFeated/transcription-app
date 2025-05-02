<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TranscriptionController extends Controller
{
    private $backendUrl = 'http://backend:8001';

    public function ping()
    {
        try {
            $response = Http::get("{$this->backendUrl}/ping");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['server' => 'offline'], 500);
        }
    }

    public function upload(Request $request)
    {
        try {
            $response = Http::attach(
                'file', 
                $request->file('file')->get(),
                $request->file('file')->getClientOriginalName()
            )->post("{$this->backendUrl}/upload", [
                'api_key' => $request->input('api_key')
            ]);

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function status($jobId)
    {
        try {
            $response = Http::get("{$this->backendUrl}/status/{$jobId}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function result($jobId)
    {
        try {
            $response = Http::get("{$this->backendUrl}/result/{$jobId}");
            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}