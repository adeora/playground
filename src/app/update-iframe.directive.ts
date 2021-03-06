import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {Http} from '@angular/http';

import {FileSystem} from '../assets/fs/vfs';

import {VirtualFsService} from './virtual-fs.service';

@Directive({selector : '[appUpdateIframe]'})
export class UpdateIframeDirective implements OnChanges {

  @Input('appUpdateIframe') generatedBundle: FileSystem;

  constructor(private iframeContainer: ElementRef,
              private fsService: VirtualFsService, private http: Http) {}

  private updateIFrame(generatedBundle: FileSystem) {
    const container = this.iframeContainer.nativeElement;
    while (container.hasChildNodes()) {
      container.removeChild(container.lastChild);
    }

    const iframe = document.createElement('iframe');
    if (generatedBundle.fileSystem) {
      // this will get loaded from the service worker
      iframe.src = '/dist/index.html';
    }
    iframe.style.cssText = 'width: 100%';
    container.appendChild(iframe);
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      const chng = changes[propName];

      if (propName === 'generatedBundle' && chng.currentValue) {
        this.updateIFrame(chng.currentValue);
      }
    }
  }
}
