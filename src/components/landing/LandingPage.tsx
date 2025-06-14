
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Rocket, Wrench, HeartHandshake } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Streamline Your Workshop Management
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Take control of your workshop with our intuitive platform. Manage
            appointments, track service history, and enhance customer
            relationships all in one place.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5 text-blue-500" />
                  Appointment Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Schedule appointments, send reminders, and keep your workflow
                  organized.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wrench className="mr-2 h-5 w-5 text-green-500" />
                  Service History Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Maintain detailed records of all services performed on each
                  vehicle.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <HeartHandshake className="mr-2 h-5 w-5 text-purple-500" />
                  Customer Relationship Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Build stronger relationships with your customers through
                  personalized service.
                </CardDescription>
              </CardContent>
            </Card>
          </dl>
        </div>

        <div className="mx-auto mt-8 flex justify-center">
          <Link to="/dashboard" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

