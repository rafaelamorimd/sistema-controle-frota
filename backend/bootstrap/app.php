<?php

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
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
