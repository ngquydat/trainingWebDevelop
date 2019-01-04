<html>
<head>
    <link href="{{ asset('css/app.css') }}" rel="stylesheet">
</head>
<body>
<section class="container">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">Thêm bình luận</div>
                <div class="card-body">
                    <form method="POST" action="{{URL('add')}}">
                        @csrf
                        <div class="form-group row">
                            <label for="email" class="col-md-4 col-form-label text-md-right">Post Title</label>
                            <div class="col-md-6"><input type="text" name="title" value="" required="required" autofocus="autofocus" class="form-control"></div>
                        </div>
                        <div class="form-group row">
                            <label for="password" class="col-md-4 col-form-label text-md-right">Post Content</label>
                            <div class="col-md-6"><textarea name="content" required="required" class="form-control"></textarea></div>
                        </div>
                        <div class="form-group row mb-0">
                            <div class="col-md-8 offset-md-4"><button type="submit" class="btn btn-primary">Gửi</button></div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</section>
</body>
</html>