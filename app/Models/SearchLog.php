<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\SearchLogFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string|null $query
 * @property string|null $category
 * @property string|null $city
 * @property string|null $country
 * @property int $results_count
 * @property string $source
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User|null $user
 *
 * @method static SearchLogFactory factory($count = null, $state = [])
 *
 * @mixin Model
 */
#[Fillable(['user_id', 'query', 'category', 'city', 'country', 'results_count', 'source'])]
final class SearchLog extends Model
{
    /** @use HasFactory<SearchLogFactory> */
    use HasFactory;

    public const SOURCE_HOME = 'home';

    public const SOURCE_SEARCH = 'search';

    public const SOURCE_OTHER = 'other';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'results_count' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
