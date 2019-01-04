@extends('layouts.app')

@section('content')
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Dashboard</div>

                <div class="card-body">
                    @if (session('status'))
                        <div class="alert alert-success" role="alert">
                            {{ session('status') }}
                        </div>
                    @endif

                    You are logged in!<a class="btn btn-primary" href="{{URL('/admin')}}">{{ __('Thêm bình luận') }}</a>
                </div>
                <div style="padding: 10px">
                    <section id="main">
                        <section id="content">
                        @foreach($posts as $post)
                            <article>
                                <h2>{{$post->title}}</h2>
                                <p>{{$post->content}}</p>
                                <p><small>Posted by <b>{{$post->Author->name}}</b> at <b>{{$post->created_at}}</b></small></p>
                                <hr>
                            </article>
                        @endforeach
                        </section>
                    </section>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection