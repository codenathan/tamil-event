<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContactRequest;
use App\Models\ContactMessage;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index()
    {
        return Inertia::render('contact');
    }

    public function store(ContactRequest $request)
    {
        ContactMessage::create([
            ...$request->validated(),
            'date' => now(),
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Your message has been sent successfully.')]);

        return to_route('contact');
    }
}
