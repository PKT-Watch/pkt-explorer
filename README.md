<p align="center">
 <img src="https://github.com/PKT-Watch/pkt-explorer/blob/main/_resources/readme/logo-bar.png?raw=true" width="420">
</p>

<h1 align="center">
PKT Explorer
</h1>

<h3 align="center">
 A block explorer for the PKT Cash blockchain built with ASP.NET Core framework and Razor Pages.
</h3>

![Dashboard](https://github.com/PKT-Watch/pkt-explorer/blob/main/_resources/readme/dashboard-dark.png?raw=true)

## Prerequisites

PKT Explorer Backend API
- This project is designed to work with a seperate API server which can be found here: https://github.com/pkt-cash/pkt-explorer-backend

ASP.NET Core framework
- ASP.NET Core is a cross-platform, open-source framework created by Microsoft. Applications can be deployed to Windows, MacOS and LInux. https://dotnet.microsoft.com/
  
An IDE capable of compiling ASP.NET Core applications.
- Visual Studio Code is a capable, cross-platform IDE with ASP.NET Core integrations. https://code.visualstudio.com/

## Configuration
There are a number of settings that can be configured in [applicationsettings.json](https://github.com/PKT-Watch/pkt-explorer/blob/main/appsettings.json) to customise the installation. Critical settings are described below:

#### ApiUrl
The URL used to access the backend API server. If the API server is installed with default settings, this value should be similar to `https://api.example.com/api/v1/PKT/pkt/` 

#### WebsiteDomain
The domain that the website will be hosted on. This value is used to generate the correct path to images that are displayed on social media platforms when a page is shared. 

## Who's using this project?

[packetscan.io](https://packetscan.io)
