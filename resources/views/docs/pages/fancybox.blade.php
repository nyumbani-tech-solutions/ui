@extends('docs::layout')

@section('page', 'Image previews')
@section('lead', 'Fancybox is bundled with the UI scripts, so any link marked data-fancybox opens its image or file in a lightbox.')

@section('content')
    <x-docs::section id="usage" title="Mark a link">
        <p>Link to the image or file and add <code>data-fancybox</code>. Add <code>data-caption</code> for the text under it. The bundle binds every such link on the page, including links inside table rows and modals that are added later, so you write no script and install no npm package.</p>
        <x-docs::code lang="blade">
            @verbatim
            <a href="{{ route('uploads.preview', ['upload' => $upload]) }}" data-fancybox data-caption="{{ $upload->title }}">
                View
            </a>
            @endverbatim
        </x-docs::code>
        <x-docs::example title="Live: click the picture">
            <a href="data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='400'%3E%3Crect width='640' height='400' fill='%23d97706'/%3E%3C/svg%3E" data-fancybox data-type="image" data-caption="A sample image" class="inline-block">
                <span class="btn btn-primary btn-sm">Preview</span>
            </a>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="attributes" title="Attributes">
        <x-docs::table :columns="['Attribute', 'Use']" :rows="[
            ['data-fancybox', 'Opens the link in the lightbox. Give several links the same value, such as data-fancybox=&quot;gallery&quot;, to flip between them.'],
            ['data-caption', 'The text shown under the image.'],
            ['data-type', 'Set it to image when the address has no file extension, such as a preview route or a blob URL.'],
        ]" />
    </x-docs::section>

    <x-docs::section id="file-input" title="In the file input">
        <p><code>&lt;x-nyumbani::file-input&gt;</code> uses it already: the thumbnail of a saved image, or of an image the user has just chosen, opens full size when clicked.</p>
        <x-docs::code lang="blade">
            @verbatim
            <x-nyumbani::file-input name="photo" label="Profile photo" accept="image/*" :current="$user->profileImage" />
            @endverbatim
        </x-docs::code>
        <x-docs::example title="Live: a saved image, then choose another">
            <x-nyumbani::file-input
                name="saved-photo"
                label="Profile photo"
                accept="image/*"
                :current="fluent(['url' => 'data:image/svg+xml;utf8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'640\' height=\'400\'%3E%3Crect width=\'640\' height=\'400\' fill=\'%23d97706\'/%3E%3C/svg%3E', 'title' => 'front-gate.png', 'formattedSize' => '84.2 KB', 'isImage' => true])"
            />
        </x-docs::example>
        <p>The saved image shows as a thumbnail with its name and size. Click the thumbnail to open it full size, or press <em>Change file</em> and pick another image: the thumbnail switches to the new file straight away, and clicking it previews that one.</p>
    </x-docs::section>

    <x-docs::section id="javascript" title="From JavaScript">
        <p>The <code>Fancybox</code> global is available for the rare case that needs it, such as opening a lightbox from code.</p>
        <x-docs::code lang="js">
            Fancybox.show([{ src: '/storage/photo.jpg', caption: 'Front gate' }]);
        </x-docs::code>
    </x-docs::section>
@endsection
