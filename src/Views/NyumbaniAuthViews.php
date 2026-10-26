<?php

namespace Nyumbani\Ui\Views;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;
use Nyumbani\Essentials\Contracts\AuthViews;

class NyumbaniAuthViews implements AuthViews
{
    /**
     * Get the sign-in page.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function loginView(): View
    {
        return view('nyumbani::auth.login');
    }

    /**
     * Get the page that asks for the e-mail to send the reset link to.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function forgotPasswordView(): View
    {
        return view('nyumbani::auth.forgot-password');
    }

    /**
     * Get the page that sets the new password, which reads the token and e-mail from the request.
     *
     * @author Alvin G. Kaburu <geekaburu@nyumbanitech.co.ke>
     */
    public function resetPasswordView(Request $request): View
    {
        return view('nyumbani::auth.reset-password', [
            'request' => $request,
        ]);
    }
}
