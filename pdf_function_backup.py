# Backup e correção da função _generate_pdf

def _generate_pdf(self, data, options, filename):
    """Gerar arquivo PDF com tratamento robusto de dependências"""
    if not data:
        return Response({'error': 'Nenhum dado para exportar'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Tentar importar bibliotecas necessárias
        from reportlab.lib.pagesizes import A4, landscape
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import cm
        from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
        
        logger.info("📄 Bibliotecas PDF importadas com sucesso, gerando PDF...")
        
        # Gerar PDF real
        buffer = io.BytesIO()
        pagesize = landscape(A4)
        doc = SimpleDocTemplate(buffer, pagesize=pagesize, 
                              rightMargin=0.8*cm, leftMargin=0.8*cm, 
                              topMargin=1.5*cm, bottomMargin=3*cm)
        
        story = []
        
        # Cabeçalho simples
        title_style = ParagraphStyle(
            'TitleStyle',
            fontSize=16,
            fontName='Helvetica-Bold',
            alignment=1,
            spaceAfter=1*cm
        )
        
        title = f"Relatório de Exportação - {filename}"
        story.append(Paragraph(title, title_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Tabela de dados
        if data and isinstance(data[0], dict):
            headers = list(data[0].keys())
            table_data = [headers]
            
            for row in data:
                table_data.append([str(row.get(col, '')) for col in headers])
            
            table = Table(table_data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))
            
            story.append(table)
        
        # Construir PDF
        doc.build(story)
        
        buffer.seek(0)
        response = HttpResponse(buffer.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}.pdf"'
        logger.info(f"✅ PDF gerado com sucesso: {filename}.pdf")
        return response
        
    except ImportError as e:
        logger.warning(f"⚠️ ReportLab não disponível: {e}")
        return self._generate_pdf_fallback(data, options, filename)
    except Exception as e:
        logger.error(f"❌ Erro ao gerar PDF: {e}")
        return self._generate_pdf_fallback(data, options, filename)

def _generate_pdf_fallback(self, data, options, filename):
    """Fallback quando PDF não pode ser gerado - retorna dados estruturados"""
    logger.info("📄 Gerando fallback estruturado para PDF")
    
    pdf_data = {
        'type': 'pdf_export_fallback',
        'filename': f"{filename}.json",
        'generated_at': timezone.now().isoformat(),
        'total_records': len(data),
        'format': 'json_fallback',
        'message': 'PDF libraries not available, returning structured data',
        'data': data,
        'summary': {
            'total_items': len(data),
            'first_item': data[0] if data else None,
            'columns': list(data[0].keys()) if data and isinstance(data[0], dict) else []
        }
    }
    
    response = JsonResponse(pdf_data, json_dumps_params={'indent': 2, 'ensure_ascii': False})
    response['Content-Disposition'] = f'attachment; filename="{filename}_fallback.json"'
    response['X-Export-Status'] = 'fallback'
    logger.info(f"✅ Fallback JSON gerado: {filename}_fallback.json")
    return response
