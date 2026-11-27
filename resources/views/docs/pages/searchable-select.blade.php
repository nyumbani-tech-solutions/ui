@extends('docs::layout')

@section('page', 'Searchable select')
@section('lead', 'Add one attribute to a select and the user types to find an option instead of scrolling a long list.')

@section('content')
    <x-docs::section id="basic" title="Add data-searchable">
        <p>Any list of records that can grow long, such as customers, agents or units, gets <code>data-searchable</code> on its <code>&lt;select&gt;</code>. Nothing else changes: the script hides the select and shows a field that filters a list in its place. The select is still what the form posts, so <code>name</code>, <code>@@selected</code>, <code>old()</code>, <code>required</code>, <code>x-model</code>, <code>wire:model</code> and change listeners work as before.</p>
        <x-docs::code lang="blade">
            @verbatim
            <label for="agent_id" aria-required="true">Agent</label>
            <select id="agent_id" name="agent_id" data-searchable @required(true)>
                <option value="">Choose an agent</option>
                @foreach ($agents as $agent)
                    <option value="{{ $agent->id }}" data-search="{{ $agent->phone }}" @selected(old('agent_id') == $agent->id)>{{ $agent->name }} - {{ $agent->email }}</option>
                @endforeach
            </select>
            @endverbatim
        </x-docs::code>
        <x-docs::example title="Live: type part of a name, an email or a phone number">
            <div x-data="{ agent: '' }" class="max-w-md space-y-1.5">
                <label for="docs-agent" aria-required="true">Agent</label>
                <select id="docs-agent" name="docs-agent" x-model="agent" data-searchable required>
                    <option value="">Choose an agent</option>
                    @foreach ([['Jane Wanjiru', 'jane@example.com', '0712 345 678'], ['Brian Otieno', 'brian@example.com', '0723 456 789'], ['Faith Chebet', 'faith@example.com', '0734 567 890'], ['Kevin Mwangi', 'kevin@example.com', '0745 678 901'], ['Mercy Achieng', 'mercy@example.com', '0756 789 012'], ['Peter Kamau', 'peter@example.com', '0767 890 123'], ['Grace Njeri', 'grace@example.com', '0778 901 234'], ['Samuel Kiprono', 'samuel@example.com', '0789 012 345'], ['Ann Muthoni', 'ann@example.com', '0790 123 456'], ['David Ouma', 'david@example.com', '0701 234 567'], ['Lucy Wambui', 'lucy@example.com', '0711 222 333'], ['José Ndegwa', 'jose@example.com', '0722 333 444']] as $index => $agent)
                        <option value="{{ $index + 1 }}" data-search="{{ $agent[2] }}">{{ $agent[0] }} - {{ $agent[1] }}</option>
                    @endforeach
                </select>
                <p class="text-sm text-gray-600">The select holds <code x-text="agent || 'nothing yet'"></code></p>
            </div>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="search" title="How it searches">
        <x-docs::table :columns="['Behaviour', 'Detail']" :rows="[
            ['Words', 'Every word typed must appear in the option, in any order: wanjiru example finds Jane Wanjiru - jane@example.com.'],
            ['Case and accents', 'Ignored, so jose finds José.'],
            ['Hidden words', 'Put words the option does not show, such as a phone number or an id number, in its data-search attribute.'],
            ['Groups', 'An optgroup shows as a heading, and its label is searched too, so typing lead lists the leads.'],
            ['Long lists', 'The first 100 matches are drawn, with a note saying how many more typing would reveal.'],
            ['Placeholder', 'The first option with an empty value is the field\'s placeholder. A select that is not required lists it first, so the user can clear the choice.'],
            ['Keyboard', 'Arrow keys move, Enter picks, Escape closes the list and leaves a modal open, Home and End jump to the ends.'],
        ]" />
    </x-docs::section>

    <x-docs::section id="groups" title="Groups and an optional choice">
        <x-docs::example title="Live: leads and customers, not required">
            <div class="max-w-md space-y-1.5">
                <label for="docs-customer">Customer</label>
                <select id="docs-customer" name="docs-customer" data-searchable>
                    <option value="">Select customer or lead</option>
                    <optgroup label="Leads">
                        <option value="lead_1">Mary Akinyi - mary@example.com</option>
                        <option value="lead_2">John Kariuki - john@example.com</option>
                    </optgroup>
                    <optgroup label="Customers">
                        <option value="customer_1">Esther Wairimu - esther@example.com</option>
                        <option value="customer_2" selected>Joseph Mutua - joseph@example.com</option>
                        <option value="customer_3" disabled>Rose Atieno - rose@example.com (archived)</option>
                    </optgroup>
                </select>
            </div>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="modal" title="In a modal">
        <p>The list floats over the page, so a modal never clips it, and Escape closes the list before it closes the modal.</p>
        <x-docs::example title="Live: a searchable select inside a modal">
            <div x-data="{ open: false, unit: '' }">
                <button type="button" class="btn btn-primary btn-sm" x-on:click="open = true">Choose a unit</button>
                <x-nyumbani::modal x-model="open" title="Choose a unit" size="md">
                    <div class="space-y-1.5 p-4">
                        <label for="docs-unit" aria-required="true">Unit</label>
                        <select id="docs-unit" name="docs-unit" x-model="unit" data-searchable required>
                            <option value="">Choose a unit</option>
                            @foreach (range(1, 250) as $number)
                                <option value="{{ $number }}">Unit {{ chr(65 + intdiv($number - 1, 50)) }}{{ str_pad(($number - 1) % 50 + 1, 2, '0', STR_PAD_LEFT) }}</option>
                            @endforeach
                        </select>
                        <p class="text-sm text-gray-600">The select holds <code x-text="unit || 'nothing yet'"></code></p>
                    </div>
                    <x-slot:action>
                        <div class="flex justify-end gap-1.5 p-3 lg:p-0">
                            <button type="button" class="btn btn-primary btn-sm" x-on:click="unit = ''">Clear from code</button>
                            <button type="button" class="btn btn-primary btn-sm" x-on:click="open = false">Done</button>
                        </div>
                    </x-slot:action>
                </x-nyumbani::modal>
            </div>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="following" title="Options and values set later">
        <p>The script follows the select after the page loads. A select that Alpine, Livewire or a modal renders later is enhanced when it appears. Options added later, such as by an <code>x-for</code> or a quick-create modal that appends the new record, show up in the list. A value set by code, such as <code>x-model</code> being reset after a save, shows in the field. Picking an option fires <code>input</code> and <code>change</code> on the select, as picking it on the select itself would.</p>
        <x-docs::example title="Live: options from x-for, and one added later">
            <div x-data="{ agents: [{ id: 1, name: 'Jane Wanjiru' }, { id: 2, name: 'Brian Otieno' }], chosen: '' }" class="max-w-md space-y-1.5">
                <label for="docs-later">Agent</label>
                <select id="docs-later" x-model="chosen" data-searchable>
                    <option value="">Choose an agent</option>
                    <template x-for="agent in agents" :key="agent.id">
                        <option :value="agent.id" x-text="agent.name"></option>
                    </template>
                </select>
                <div class="flex flex-wrap items-center gap-1.5">
                    <button type="button" class="btn btn-primary btn-sm" x-on:click="agents.push({ id: agents.length + 1, name: 'New agent ' + (agents.length + 1) }); chosen = agents.length">Add and pick an agent</button>
                    <span class="text-sm text-gray-600">The select holds <code x-text="chosen || 'nothing yet'"></code></span>
                </div>
            </div>
        </x-docs::example>
    </x-docs::section>

    <x-docs::section id="limits" title="Limits">
        <ul class="list-disc space-y-1 pl-5">
            <li>A <code>multiple</code> select is left as it is.</li>
            <li>The options are all in the page, so the search runs in the browser. A list too long to send with the page, many thousands of records, needs a search on the server instead.</li>
            <li>The field copies the select's classes once, when it is enhanced. Style the select as you would any other.</li>
            <li>The texts <em>No matches</em>, <em>Keep typing to see :count more</em> and <em>Search</em> go through <code>window.__()</code>: add them to <code>js_translations</code> in <code>config/ui.php</code> to translate them.</li>
        </ul>
    </x-docs::section>
@endsection
