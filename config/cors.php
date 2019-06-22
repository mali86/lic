<?php

return [
    /*
     |--------------------------------------------------------------------------
     | Laravel CORS
     |--------------------------------------------------------------------------
     |

     | allowedOrigins, allowedHeaders and allowedMethods can be set to array('*')
     | to accept any value.
     |
     */
    //'supportsCredentials' => true,
   // 'allowedOrigins' => ['*'],
    //'allowedHeaders' => ['Content-Type', 'Access-Control-Allow-Headers', 'Authorization', 'X-Requested-With'],
   // 'allowedMethods' => ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'HEAD'],
   // 'exposedHeaders' => ['*'],
    //'maxAge' => 3600,
   // 'hosts' => [],
   'supportsCredentials' => true,
    'allowedOrigins' => ['*'],
    'allowedHeaders' => ['*'],
    'allowedMethods' => ['*'],
    'exposedHeaders' => ['*'],
    'maxAge' => 3600,
    'hosts' => [],
];

