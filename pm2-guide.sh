#!/bin/bash

# Commandes PM2 pour gérer votre application Job Board AI

echo "🚀 Guide des commandes PM2 pour Job Board AI"
echo "============================================="

echo ""
echo "📊 STATUT DE L'APPLICATION:"
echo "pm2 status                    # Voir le statut"
echo "pm2 monit                     # Monitoring en temps réel" 
echo "pm2 info job-board-ai         # Infos détaillées"

echo ""
echo "📋 LOGS:"
echo "pm2 logs job-board-ai         # Voir les logs en temps réel"
echo "pm2 logs job-board-ai --lines 50   # Voir les 50 dernières lignes"
echo "pm2 flush job-board-ai        # Vider les logs"

echo ""
echo "🔄 GESTION DU PROCESSUS:"
echo "pm2 restart job-board-ai      # Redémarrer"
echo "pm2 reload job-board-ai       # Rechargement à chaud"
echo "pm2 stop job-board-ai         # Arrêter"
echo "pm2 delete job-board-ai       # Supprimer définitivement"

echo ""
echo "⚡ ACTIONS RAPIDES:"
echo "pm2 restart all               # Redémarrer toutes les apps"
echo "pm2 stop all                  # Arrêter toutes les apps" 
echo "pm2 delete all                # Supprimer toutes les apps"

echo ""
echo "🔧 CONFIGURATION:"
echo "pm2 startup                   # Configurer le démarrage auto"
echo "pm2 save                      # Sauvegarder la config actuelle"
echo "pm2 resurrect                 # Restaurer les processus sauvés"

echo ""
echo "📈 PERFORMANCE:"
echo "pm2 show job-board-ai         # Métriques détaillées"
echo "pm2 reset job-board-ai        # Reset des compteurs"

echo ""
echo "🌐 Application disponible sur :"
echo "http://localhost:3333"
echo "http://$(curl -s ifconfig.me):3333"

echo ""
echo "💡 TIPS:"
echo "• L'app continue à tourner même si vous fermez le terminal"
echo "• PM2 redémarre automatiquement l'app si elle crash"
echo "• Les logs sont dans /root/job-board-ai/logs/"
