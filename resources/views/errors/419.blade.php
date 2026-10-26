@extends('nyumbani::layouts.error')

@section('code', '419')
@section('heading', 'The page expired')
@section('detail', 'The page sat idle for too long and expired for your safety. Go back and reload it; anything you had not saved was not sent.')
@section('icon')
    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/>
@endsection
