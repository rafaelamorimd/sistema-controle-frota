<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Route::model('condutor', \App\Models\Condutor::class);
        Route::model('condutore', \App\Models\Condutor::class);

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('login', function (Request $request) {
            $key = $request->ip() . '|' . $request->input('email', '');
            return Limit::perMinute(5)->by($key)->response(function () {
                return response()->json([
                    'message' => 'Muitas tentativas de login. Tente novamente em 1 minuto.',
                ], 429);
            });
        });
    }
}
