<?php

namespace App\Console\Commands;

use App\Contracts\Repositories\AreaRepository;
use App\Models\Area;
use App\Models\State;
use Illuminate\Console\Command;
use GuzzleHttp\Exception\GuzzleException;
use GuzzleHttp\Client;

class AddStatesAndAreas extends Command
{
    private $areaRepository;
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'add-states-and-areas';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Add states and areas.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct(AreaRepository $areaRepository)
    {
        parent::__construct();
        $this->areaRepository = $areaRepository;
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        foreach ($this->getStates() as $key => $row) {
            $state = new State();
            $state->name = $row;

            $state->save();

            $this->info($state->name.' state successfully added.');
        }
        $client = new \GuzzleHttp\Client();
        $response = $client->request('GET', 'http://www.areacodelocations.info/allcodes.html');

        $body = $response->getBody();

        $dom = new \DOMDocument;
        $dom->loadHTML($body);

        $stateName = '';

        foreach($dom->getElementsByTagName('tr') as $tr) {
            $row = [];
            foreach ($tr->getElementsByTagName('td') as $td) {
                $row[] = $dom->saveHTML($td);
            }
            if (count($row) == 3) {
                $stateName = explode('<', explode('>', $row[0])[1])[0];
                $areas = explode(', ', $row[2]);
            } else if (count($row) == 2) {
                $areas = explode(', ', $row[1]);
            } else {
                $areas = [];
            }

            $state = State::where('name', '=', $stateName)->first();

            if ($state) {
                foreach ($areas as $areaName) {
                    $area = new Area();
                    $area->state_id = $state->id;

                    $areaName = str_replace("<td>", "", $areaName);
                    $areaName = str_replace("</td>", "", $areaName);

                    $area->name = $areaName;

                    $this->areaRepository->store($area);

                    $this->info($areaName.' area successfully added to '.$state->name.' state.');
                }
            }
        }
    }

    private function getStates()
    {
        return Array(
            'AL'=>"Alabama",
            'AK'=>"Alaska",
            'AZ'=>"Arizona",
            'AR'=>"Arkansas",
            'CA'=>"California",
            'CO'=>"Colorado",
            'CT'=>"Connecticut",
            'DE'=>"Delaware",
            'DC'=>"District Of Columbia",
            'FL'=>"Florida",
            'GA'=>"Georgia",
            'HI'=>"Hawaii",
            'ID'=>"Idaho",
            'IL'=>"Illinois",
            'IN'=>"Indiana",
            'IA'=>"Iowa",
            'KS'=>"Kansas",
            'KY'=>"Kentucky",
            'LA'=>"Louisiana",
            'ME'=>"Maine",
            'MD'=>"Maryland",
            'MA'=>"Massachusetts",
            'MI'=>"Michigan",
            'MN'=>"Minnesota",
            'MS'=>"Mississippi",
            'MO'=>"Missouri",
            'MT'=>"Montana",
            'NE'=>"Nebraska",
            'NV'=>"Nevada",
            'NH'=>"New Hampshire",
            'NJ'=>"New Jersey",
            'NM'=>"New Mexico",
            'NY'=>"New York",
            'NC'=>"North Carolina",
            'ND'=>"North Dakota",
            'OH'=>"Ohio",
            'OK'=>"Oklahoma",
            'OR'=>"Oregon",
            'PA'=>"Pennsylvania",
            'RI'=>"Rhode Island",
            'SC'=>"South Carolina",
            'SD'=>"South Dakota",
            'TN'=>"Tennessee",
            'TX'=>"Texas",
            'UT'=>"Utah",
            'VT'=>"Vermont",
            'VA'=>"Virginia",
            'WA'=>"Washington",
            'WV'=>"West Virginia",
            'WI'=>"Wisconsin",
            'WY'=>"Wyoming");
    }
}
