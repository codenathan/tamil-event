<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('contact');
    }

    public function store(ContactRequest $request)
    {
        ContactMessage::create($request->validated());

        return redirect()->back()->with('success', 'Your message has been sent successfully.');
    }
}
