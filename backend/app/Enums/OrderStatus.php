<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Created = 'created';
    case Preparing = 'preparing';
    case ReadyForPickup = 'ready_for_pickup';
    case PickedUp = 'picked_up';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
