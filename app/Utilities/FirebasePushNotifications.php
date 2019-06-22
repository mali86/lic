<?php

namespace App\Utilities;

use App\Models\PushNotificationSubscriber;
use LaravelFCM\Facades\FCM;
use LaravelFCM\Message\PayloadDataBuilder;
use LaravelFCM\Message\PayloadNotificationBuilder;
use LaravelFCM\Message\Topics;

class FirebasePushNotifications
{
    public function sendNotificationToTopic($topicName, $title, $body, $data = null, $icon = null) {
        $notificationBuilder = new PayloadNotificationBuilder($title);
        $notificationBuilder->setBody($body)
            ->setSound('default');
        if ($icon) {
            $notificationBuilder->setIcon($icon);
        }

        $notification = $notificationBuilder->build();

        if ($data != null) {
            $dataBuilder = new PayloadDataBuilder();
            $dataBuilder->addData($data);

            $data = $dataBuilder->build();
        }

        $topic = new Topics();
        $topic->topic($topicName);

        $topicResponse = FCM::sendToTopic($topic, null, $notification, $data);

        $topicResponse->isSuccess();
        $topicResponse->shouldRetry();
        $topicResponse->error();
    }
}
