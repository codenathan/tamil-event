<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\EnquireStatusEnum;
use Database\Factories\EnquireFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $vendor_id
 * @property string $name
 * @property Carbon $date
 * @property string $email
 * @property string $message
 * @property EnquireStatusEnum $status
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Vendor $vendor
 *
 * @method static EnquireFactory factory($count = null, $state = [])
 *
 * @mixin Model
 */
#[Fillable(['vendor_id', 'name', 'date', 'email', 'message', 'status'])]
final class Enquire extends Model
{
    /** @use HasFactory<EnquireFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'status' => EnquireStatusEnum::class,
        ];
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class);
    }
}
