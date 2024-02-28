/* eslint-disable @typescript-eslint/no-explicit-any */
import { action } from '@ember/object';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import type { Bindings } from 'rdf-js';
import { determineDocumentType } from './validation';

import { fetchDocument, getPublicationFromFileContent } from './queries';

export default class DocumentService extends Service {
  @tracked document: Bindings[] = [];
  @tracked documentURL: string = '';
  @tracked documentType: string = '';
  @tracked documentFile: File | null = null;

  @service declare toaster: any;

  constructor() {
    // eslint-disable-next-line prefer-rest-params
    super(...arguments);

    // Load data from local storage on initialization
    this.loadFromLocalStorage();
  }

  @action async handleDocumentTypeChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.documentType = target.value;

    // Save to local storage
    this.saveToLocalStorage();
  }

  @action async processPublication({ fileUrl }: { fileUrl: string }) {
    const document: any = await fetchDocument(fileUrl).then((resp) => {
      return resp;
    });
    const documentType: any = await determineDocumentType(document).then(
      (resp) => {
        return resp;
      },
    );
    this.document = document;
    this.saveToLocalStorage();

    return documentType;
  }

  @action async processDocumentFile(file: File) {
    this.documentFile = file;
    const html = await file.text();
    const document = await getPublicationFromFileContent(html);
    this.document = document;
    this.documentType = determineDocumentType(document);

    if (this.documentType && this.documentType !== 'unknown document type') {
      // Save to local storage
      this.saveToLocalStorage();
      return true;
    } else {
      this.documentType = '';
      this.toaster.error(
        'Deze publicatie heeft geen documenttype',
        'Kies een type uit de lijst',
      );
      return false;
    }
  }

  @action async processDocumentURL(fileUrl: string) {
    this.documentURL = fileUrl;
    this.documentType =
      (await this.processPublication({ fileUrl: fileUrl })) || '';

    if (this.documentType && this.documentType !== 'unknown document type') {
      // Save to local storage
      this.saveToLocalStorage();
      return true;
    } else {
      this.documentType = '';
      this.toaster.error(
        'Deze publicatie heeft geen documenttype',
        'Kies een type uit de lijst',
      );
      return false;
    }
  }

  // Function to save data to local storage
  saveToLocalStorage() {
    localStorage.setItem(
      'documentServiceData',
      JSON.stringify({
        document: this.document,
        documentURL: this.documentURL,
        documentType: this.documentType,
        documentFile: this.documentFile,
      }),
    );
  }

  // Function to load data from local storage
  loadFromLocalStorage() {
    const data = localStorage.getItem('documentServiceData');
    if (data) {
      const { document, documentURL, documentType, documentFile } =
        JSON.parse(data);
      this.document = document;
      this.documentURL = documentURL;
      this.documentType = documentType;
      this.documentFile = documentFile;
    }
  }
}
declare module '@ember/service' {
  interface Registry {
    document: DocumentService;
  }
}
