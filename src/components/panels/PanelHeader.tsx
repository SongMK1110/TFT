import styles from './PanelHeader.module.css';

type PanelHeaderProps = {
  title: string;
  meta?: string;
};

export function PanelHeader({ title, meta }: PanelHeaderProps) {
  return (
    <div className={styles.header}>
      <span>{title}</span>
      {meta ? <small>{meta}</small> : null}
    </div>
  );
}
