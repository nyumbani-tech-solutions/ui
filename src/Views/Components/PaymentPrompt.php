<?php

namespace Nyumbani\Ui\Views\Components;

use Illuminate\Contracts\View\View;
use Illuminate\View\Component;
use LogicException;

class PaymentPrompt extends Component
{
    /**
     * What the script is given: the attempt, the urls, the Reverb settings and the wording
     *
     * @var array<string, mixed>
     */
    public array $settings;

    /**
     * The amount in the format of the app, or null when the page shows none
     */
    public ?string $amountLabel;

    /**
     * The sentence shown while the payer enters the PIN, with the number and the amount in bold
     */
    public string $pendingMessage;

    /**
     * Create the prompt, which follows the attempt the app started: pass the contract the app got back, the check url that backs the I have paid button (and the polling), and whether a push was sent to the payer at all. The mode is websocket (Reverb) or poll (asks the check url every interval seconds), and defaults to websocket when Reverb is set up
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function __construct(
        public array $attempt,
        public ?string $checkUrl = null,
        public bool $pushed = true,
        public ?string $redirect = null,
        public ?int $timeout = null,
        public int $confirmTimeout = 30,
        public ?string $mode = null,
        public ?int $interval = null,
        public ?int $duration = null,
    ) {
        //  Wait as long as the prompt asks for, or as long as the attempt says
        $this->timeout = $timeout ?? (int) ($attempt['timeout'] ?? 120);

        //  Follow the way the prompt asks for, or the attempt says, or by a websocket when Reverb is set up and else by polling the check url
        $this->mode = $this->mode ?: ($attempt['mode'] ?? null) ?: null;
        $this->mode ??= filled(config('ui.broadcasting.key')) && filled(config('ui.broadcasting.host'))
            ? 'websocket'
            : 'poll';

        //  Refuse a mode that does not exist
        if (! in_array($this->mode, ['websocket', 'poll'], true)) {
            throw new LogicException('<x-nyumbani::payment-prompt> mode must be "websocket" or "poll".');
        }

        //  A websocket needs Reverb
        if ($this->mode === 'websocket' && (blank(config('ui.broadcasting.key')) || blank(config('ui.broadcasting.host')))) {
            throw new LogicException('<x-nyumbani::payment-prompt> needs Reverb: set REVERB_APP_KEY and REVERB_HOST, or the UI_ECHO_* keys (see config/ui.php), or use mode="poll".');
        }

        //  Polling asks the check url, so it needs one
        if ($this->mode === 'poll' && blank($checkUrl)) {
            throw new LogicException('<x-nyumbani::payment-prompt> in poll mode needs a check-url to ask.');
        }

        //  Format the amount the way the app does
        $this->amountLabel = isset($attempt['manual']['amount'])
            ? money((float) $attempt['manual']['amount'])
            : null;

        //  Say who was prompted and for how much, with both in bold and escaped
        $this->pendingMessage = $this->amountLabel && ($attempt['phone'] ?? null)
            ? __('We have initiated an MPESA PIN prompt to your phone number, :phone. :amount will be deducted. Enter your PIN and wait for a few seconds for the payment to process...', [
                'phone' => '<strong>'.e($attempt['phone']).'</strong>',
                'amount' => '<strong>'.e($this->amountLabel).'</strong>',
            ])
            : e(__('Enter your PIN on the MPESA prompt on your phone and wait for a few seconds for the payment to process...'));

        //  Hand the script what it needs
        $this->settings = [
            'attempt' => $attempt,
            'checkUrl' => $checkUrl,
            'pushed' => $pushed,
            'redirect' => $redirect,
            'timeout' => $this->timeout,
            'confirmTimeout' => $confirmTimeout,
            'mode' => $this->mode,
            'interval' => max(1, (int) ($interval ?? $attempt['interval'] ?? 3)),
            'duration' => max(1, (int) ($duration ?? $attempt['duration'] ?? 300)),
            'echo' => config('ui.broadcasting'),
            'texts' => $this->texts(),
        ];
    }

    /**
     * Get the wording the script shows, by status and by reason for a failure
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    protected function texts(): array
    {
        return [
            'statuses' => [
                'pending' => $this->amountLabel && ($this->attempt['phone'] ?? null)
                    ? __('We have initiated an MPESA PIN prompt to your phone number, :phone. :amount will be deducted. Enter your PIN and wait for a few seconds for the payment to process...', ['phone' => $this->attempt['phone'], 'amount' => $this->amountLabel])
                    : __('Enter your PIN on the MPESA prompt on your phone and wait for a few seconds for the payment to process...'),
                'paid' => __('Payment received. We are confirming it...'),
                'confirmed' => __('Thank you! Your payment has been confirmed.'),
                'manual' => __('Pay with M-Pesa using the details below.'),
            ],
            'titles' => [
                'pending' => __('Watch out for an MPESA PIN prompt on your phone!'),
                'paid' => __('Payment received'),
                'confirmed' => __('Payment confirmed'),
                'failed' => __('Payment failed'),
                'manual' => __('Pay with M-Pesa'),
            ],
            'checking' => __('Checking...'),
            'copy' => __('Copy'),
            'copied' => __('Copied'),
            'copiedToast' => __('Copied to clipboard'),
            'copyFailed' => __('Could not copy. Please type it in.'),
            'waiting' => __('If you do not receive the prompt, we will redirect you to another mode of MPESA payment in :time...'),
            'seconds' => [__('second'), __('seconds')],
            'slow' => __('We have received your payment and are still confirming it. You do not need to pay again.'),
            'reasons' => [
                'cancelled' => __('Cancelled on your phone.'),
                'insufficient-funds' => __('Not enough M-Pesa balance.'),
                'wrong-pin' => __('Wrong M-Pesa PIN.'),
                'timeout' => __('The request timed out.'),
                'rejected' => __('We could not reach your phone.'),
                'connection' => __('We lost the connection.'),
                'request' => __('We could not start the payment.'),
                'no-response' => __('No response. Check your M-Pesa messages before paying again.'),
                'other' => __('The payment did not go through.'),
            ],
        ];
    }

    /**
     * Get the view
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function render(): View
    {
        return view('nyumbani::components.payment-prompt');
    }
}
