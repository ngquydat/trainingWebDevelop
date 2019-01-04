<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use View;
use App\Post;

class HomeController extends Controller
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

    /**
     * Show the application dashboard.
     *
     * @return \Illuminate\Contracts\Support\Renderable
     */
    public function index()
    {
        $posts = Post::with('Author')->orderBy('id', 'DESC')->get();
        return View::make('home')->with('posts',$posts);
    }
}
