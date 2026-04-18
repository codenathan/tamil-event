<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ContactMessageEnum;
use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Inertia\Inertia;

class InboxController extends Controller
{
    public function index()
    {
        $messages = ContactMessage::latest()->paginate(10);

        return Inertia::render('admin/inbox', [
            'messages' => $messages,
        ]);
    }

    public function markAsRead(ContactMessage $message)
    {
        $message->update(['status' => ContactMessageEnum::READ->value]);

        return back();
    }

    public function destroy(ContactMessage $message)
    {
        $message->delete();

        return back();
    }
}
