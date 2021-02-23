import {Component, OnInit, Input, HostListener} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subscription} from 'rxjs/Subscription';
import {EEGSample, channelNames} from 'muse-js';

@Component({
  selector: 'app-recorder',
  templateUrl: './recorder.component.html',
  styleUrls: ['./recorder.component.css']
})
export class RecorderComponent implements OnInit {
  @Input() data: Observable<EEGSample>;

  recording = false;
  pressed = 0;

  private samples: number[][];
  private subscription: Subscription;

  constructor() {
  }

  ngOnInit() {
  }

  @HostListener('window:keyup', ['$event'])
  keyUpEvent(event: KeyboardEvent) {
    if (event.key === ' ') {
      this.pressed = 1;
    }
  }

  @HostListener('window:keydown', ['$event'])
  keyDownEvent(event: KeyboardEvent) {
    if (event.key === ' ') {
      this.pressed = 0;
    }
  }


  startRecording() {
    this.recording = true;
    this.samples = [];
    this.subscription = this.data.subscribe(sample => {
      this.samples.push([sample.timestamp, ...sample.data, this.pressed]);
    });
  }

  stopRecording() {
    this.recording = false;
    this.subscription.unsubscribe();
    this.saveToCsv(this.samples);
  }

  get sampleCount() {
    return this.samples.length;
  }

  saveToCsv(samples: number[][]) {
    const a = document.createElement('a');
    const headers = ['time', ...channelNames, 'command'].join(',');
    const csvData = headers + '\n' + samples.map(item => item.join(',')).join('\n');
    const file = new Blob([csvData], {type: 'text/csv'});
    a.href = URL.createObjectURL(file);
    document.body.appendChild(a);
    a.download = 'recording.csv';
    a.click();
    document.body.removeChild(a);
  }
}
