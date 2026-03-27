<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API com Bearer token: nao usar SPA stateful (CSRF). Remove o middleware mesmo se alguem reativar statefulApi().
        $middleware->api(remove: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->throttleApi();
        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);
    })
    ->withSchedule(function (Schedule $schedule): void {
        $schedule->command('gefther:gerar-pagamentos-semanais')->weeklyOn(1, '08:00');
        $schedule->command('gefther:lancar-despesa-rastreador')->monthlyOn(1, '06:00');
        $schedule->command('gefther:gerar-alertas')->dailyAt('07:00');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
