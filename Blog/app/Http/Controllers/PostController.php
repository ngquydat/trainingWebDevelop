<?php
namespace App\Http\Controllers;

use Auth;
use View;
use App\Post;
use Illuminate\Support\Facades\Input;

class PostController extends Controller
{
    /**
     * Create a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth');
    }
    public function getAdmin()
    {
        return View::make('addpost');
    }
    public function postAdd()
    {
        Post::create(array(
            'title'     => Input::get('title'),
            'content'   => Input::get('content'),
            'author_id' => Auth::user()->id
        ));
        return redirect('/home');
    }
}