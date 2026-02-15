import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'
import type { Invoice } from '@/types/invoice'
import dayjs from 'dayjs'

;(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs ?? (pdfFonts as any).default?.pdfMake?.vfs ?? (pdfFonts as any).vfs

const formatCurrency = (value: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(value).replace(/\s/g, ' ')

export function generateInvoicePdf(invoice: Invoice) {
  const clientName =
    invoice.client?.nom ||
    (typeof invoice.clientId === 'object'
      ? (invoice.clientId as any)?.nom
      : invoice.clientId)

  const clientPhone = invoice.client?.telephone || ''

  const lignesBody = (invoice.lignes || []).map((line, index) => {
    const produitNom =
      line.produit?.nom ||
      (typeof line.produitId === 'object'
        ? (line.produitId as any)?.nom
        : line.produitId)

    return [
      { text: String(index + 1), alignment: 'center' as const },
      { text: produitNom || '-' },
      { text: String(line.quantite ?? 0), alignment: 'center' as const },
      { text: formatCurrency(line.prixUnitaire ?? 0), alignment: 'right' as const },
      { text: formatCurrency((line as any).total ?? 0), alignment: 'right' as const },
    ]
  })

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 60],
    content: [
      // Business header
      {
        stack: [
          { text: 'NDIAYE ABDOURAHMANE', style: 'businessName', alignment: 'center' as const },
          { text: 'Wakeur Serigne Darou Assane NDIAYE', alignment: 'center' as const, fontSize: 12, italics: true, color: '#475569', margin: [0, 2, 0, 0] },
          { text: 'Commerçant Vente de Produits Cosmétiques, Habillements, Radio et Divers', alignment: 'center' as const, fontSize: 10, color: '#64748b', margin: [0, 2, 0, 0] },
          { text: 'Marché Boucotte - Ziguinchor', alignment: 'center' as const, fontSize: 10, color: '#64748b', margin: [0, 2, 0, 0] },
          { text: 'Tél : 77 572 73 70 - 77 917 43 30 84', alignment: 'center' as const, fontSize: 10, color: '#64748b', margin: [0, 2, 0, 0] },
        ],
        margin: [0, 0, 0, 15],
      },

      // Separator top
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 2, lineColor: '#2563eb' }], margin: [0, 0, 0, 15] },

      // Invoice header
      {
        columns: [
          {
            stack: [
              { text: 'FACTURE', style: 'title' },
              { text: `N° ${invoice.numero}`, style: 'invoiceNumber', margin: [0, 4, 0, 0] },
            ],
          },
          {
            stack: [
              { text: `Date d'émission : ${dayjs(invoice.dateEmission).format('DD/MM/YYYY')}`, alignment: 'right' as const },
              { text: `Date d'échéance : ${dayjs(invoice.dateEcheance).format('DD/MM/YYYY')}`, alignment: 'right' as const, margin: [0, 4, 0, 0] },
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Separator
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#2563eb' }], margin: [0, 0, 0, 20] },

      // Client info
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Client', style: 'sectionHeader' },
              { text: clientName, style: 'clientName', margin: [0, 4, 0, 0] },
              ...(clientPhone ? [{ text: `Tél : ${clientPhone}`, style: 'small', margin: [0, 2, 0, 0] as [number, number, number, number] }] : []),
            ],
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Table
      {
        table: {
          headerRows: 1,
          widths: [30, '*', 50, 100, 100],
          body: [
            [
              { text: '#', style: 'tableHeader', alignment: 'center' as const },
              { text: 'Produit', style: 'tableHeader' },
              { text: 'Qté', style: 'tableHeader', alignment: 'center' as const },
              { text: 'Prix unitaire', style: 'tableHeader', alignment: 'right' as const },
              { text: 'Total', style: 'tableHeader', alignment: 'right' as const },
            ],
            ...lignesBody,
          ],
        },
        layout: {
          hLineWidth: (i: number, node: any) => (i === 0 || i === 1 || i === node.table.body.length) ? 1 : 0.5,
          vLineWidth: () => 0,
          hLineColor: (i: number) => (i === 0 || i === 1) ? '#2563eb' : '#e5e7eb',
          paddingLeft: () => 8,
          paddingRight: () => 8,
          paddingTop: () => 6,
          paddingBottom: () => 6,
          fillColor: (i: number) => (i > 0 && i % 2 === 0) ? '#f8fafc' : null,
        },
        margin: [0, 0, 0, 15],
      },

      // Total
      {
        columns: [
          { width: '*', text: '' },
          {
            width: 'auto',
            table: {
              widths: [120, 120],
              body: [
                [
                  { text: 'TOTAL', style: 'totalLabel', alignment: 'right' as const },
                  { text: formatCurrency(invoice.total ?? 0), style: 'totalValue', alignment: 'right' as const },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 1,
              vLineWidth: () => 0,
              hLineColor: () => '#2563eb',
              paddingLeft: () => 10,
              paddingRight: () => 10,
              paddingTop: () => 8,
              paddingBottom: () => 8,
              fillColor: () => '#eff6ff',
            },
          },
        ],
        margin: [0, 0, 0, 20],
      },

      // Notes
      ...(invoice.notes
        ? [
            { text: 'Notes', style: 'sectionHeader', margin: [0, 10, 0, 4] as [number, number, number, number] },
            { text: invoice.notes, style: 'small' },
          ]
        : []),
    ],

    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `Facture ${invoice.numero}`, style: 'footer' },
        { text: `Page ${currentPage} / ${pageCount}`, style: 'footer', alignment: 'right' as const },
      ],
      margin: [40, 0, 40, 0],
    }),

    styles: {
      businessName: {
        fontSize: 22,
        bold: true,
        color: '#1e293b',
      },
      title: {
        fontSize: 24,
        bold: true,
        color: '#2563eb',
      },
      invoiceNumber: {
        fontSize: 12,
        color: '#64748b',
      },
      sectionHeader: {
        fontSize: 10,
        bold: true,
        color: '#2563eb',
      },
      clientName: {
        fontSize: 14,
        bold: true,
      },
      small: {
        fontSize: 9,
        color: '#64748b',
      },
      tableHeader: {
        fontSize: 9,
        bold: true,
        color: '#ffffff',
        fillColor: '#2563eb',
      },
      totalLabel: {
        fontSize: 11,
        bold: true,
        color: '#1e40af',
      },
      totalValue: {
        fontSize: 13,
        bold: true,
        color: '#1e40af',
      },
      footer: {
        fontSize: 8,
        color: '#94a3b8',
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  }

  pdfMake.createPdf(docDefinition).open()
}
