<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class ListYourBusinessController extends Controller
{
    public function index()
    {
        return Inertia::render('list-your-business');
    }

    public function store(Request $request)
    {
        dd($request->all());
    }
}
