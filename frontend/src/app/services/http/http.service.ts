import { Injectable } from '@angular/core';
import { HttpClient, HttpHandler } from '@angular/common/http';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor() {}

  async post(url: string, data: any) {
    const response = axios.post(url, data);
    return (await response).data;
  }

  async get(url: string) {
    const response = axios.get(url);
    return (await response).data;
  }
}
